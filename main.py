import hashlib
import os
import time

import pandas as pd
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, text


class LoginRequest(BaseModel):
    username: str
    password: str


class ConfigRequest(BaseModel):
    name: str
    url: str
    baseUrl: str
    token: str
    source: str = None
    status: int = 1


class UpdateConfigRequest(BaseModel):
    id: int


class ApiResponse(BaseModel):
    status: int
    msg: str
    data: str | dict | list = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv('.env')

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index():
    return FileResponse('static/index.html')


@app.post('/api/login', response_model=ApiResponse)
async def login(request: LoginRequest):
    result = True if request.username == os.getenv('CODEX_USERNAME') and request.password == os.getenv(
        'CODEX_PASSWORD') else False

    data = os.getenv('TOKEN_PREFIX') + str(int(time.time()) + int(os.getenv("TOKEN_EXPIRE")))
    data += "_" + hashlib.md5(data.encode()).hexdigest()
    return ApiResponse(status=200 if result else 401, msg='ok' if result else 'error', data=data if result else None)


async def AuthMiddleware(request: Request):
    token = request.headers.get('codex-token')
    if not token:
        raise HTTPException(status_code=401, detail={"status": 401, "msg": "token 缺失"})

    try:
        tokens = token.split("_")
        if int(tokens[1]) < int(time.time()):
            raise HTTPException(status_code=401, detail={"status": 401, "msg": "token 已过期"})

        if hashlib.md5(f"{tokens[0]}_{tokens[1]}".encode()).hexdigest() != tokens[2]:
            raise HTTPException(status_code=401, detail={"status": 401, "msg": "无效的 token"})

        return None
    except (IndexError, ValueError) as e:
        raise HTTPException(status_code=401, detail={"status": 401, "msg": "token 格式无效"})


@app.get("/api/codex_configs", response_model=ApiResponse, dependencies=[Depends(AuthMiddleware)])
async def configs():
    engine = create_engine(
        f'mysql+pymysql://{os.getenv("db_username")}:{os.getenv("db_password")}@{os.getenv("db_host")}:{os.getenv("db_port")}/{os.getenv("db_database")}?charset=utf8',
        echo=False)

    df = pd.read_sql('SELECT `id`, `name`, `url`, `base_url` AS `baseUrl`, `token`, `status` FROM `configs`',
                     con=engine)
    return ApiResponse(status=200, msg='ok', data=df.to_dict('records'))


@app.post('/api/add/config', response_model=ApiResponse, dependencies=[Depends(AuthMiddleware)])
async def AddConfig(request: ConfigRequest):
    try:
        engine = create_engine(
            f'mysql+pymysql://{os.getenv("db_username")}:{os.getenv("db_password")}@{os.getenv("db_host")}:{os.getenv("db_port")}/{os.getenv("db_database")}?charset=utf8',
            echo=False)

        data = {
            'name': [request.name],
            'url': [request.url],
            'base_url': [request.baseUrl],
            'token': [request.token],
            'source': [request.source],
            'status': [request.status],
        }
        df = pd.DataFrame(data)
        df.to_sql('configs', con=engine, if_exists='append', index=False)

        return ApiResponse(status=200, msg='ok')
    except Exception as e:
        return ApiResponse(status=500, msg=str(e))


@app.post('/api/config/update', response_model=ApiResponse, dependencies=[Depends(AuthMiddleware)])
async def updateConfig(request: UpdateConfigRequest):
    engine = create_engine(
        f'mysql+pymysql://{os.getenv("db_username")}:{os.getenv("db_password")}@{os.getenv("db_host")}:{os.getenv("db_port")}/{os.getenv("db_database")}?charset=utf8',
        echo=False)

    with engine.connect() as conn:
        update_stmt = text("UPDATE configs SET status = 1 - status WHERE id = :id")
        result = conn.execute(update_stmt, {"id": request.id})
        conn.commit()  # 提交更改
        print(f"受影响行数: {result.rowcount}")

        return ApiResponse(status=200, msg='ok')


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8001)
