FROM python:3.10

WORKDIR /app

# 필수 시스템 라이브러리 설치 (OpenCV가 사용하는 libGL 등 포함)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 파이썬 라이브러리 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY . .

# Gunicorn으로 실행 (워커 4개, 워커 당 스레드 2개)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "4", "--threads", "2", "--capture-output", "--log-level=info"]
