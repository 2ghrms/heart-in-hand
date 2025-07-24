from flask import Flask, request, jsonify
import pika
import json
from analyze import analyze_image_base64
from dotenv import load_dotenv
import os
import logging
import traceback
import sys

# ──────────────── 1. 환경 변수 로드 ────────────────
load_dotenv()

# ──────────────── 2. 로깅 설정 ────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ──────────────── 3. Flask App 생성 ────────────────
app = Flask(__name__)

MQ_URL = os.getenv('RABBITMQ_URL')
MQ_RESULT_QUEUE = os.getenv('RABBITMQ_RESULT_QUEUE')

# 환경 변수 로딩 확인 로그
logger.info("🔍 ENV 체크 시작")
logger.info(f"NAVER_OCR_API_URL: {os.getenv('NAVER_OCR_API_URL') or '❌ 없음'}")
logger.info(f"NAVER_OCR_SECRET_KEY: {'✅ 있음' if os.getenv('NAVER_OCR_SECRET_KEY') else '❌ 없음'}")
logger.info(f"RABBITMQ_URL: {os.getenv('RABBITMQ_URL') or '❌ 없음'}")
logger.info(f"RABBITMQ_RESULT_QUEUE: {os.getenv('RABBITMQ_RESULT_QUEUE') or '❌ 없음'}")
logger.info("✅ Flask 서버 시작")

# ──────────────── 4. 이미지 분석 엔드포인트 ────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        note_image_id = data.get('noteImageId')
        image_base64 = data.get('imageBase64')
        file_name = data.get('fileName')

        logger.info(f"📥 받은 요청 - ID: {note_image_id}, file: {file_name}, base64 length: {len(image_base64) if image_base64 else 'N/A'}")

        if not (note_image_id and image_base64):
            logger.warning("❌ 필수 입력 누락: noteImageId 또는 imageBase64")
            return jsonify({'error': 'noteImageId, imageBase64 are required'}), 400

        result = analyze_image_base64(image_base64, file_name, note_image_id)
        send_result_to_mq(result)

        return jsonify({'status': 'success'}), 200
    except Exception as e:
        logger.error("❌ 에러 발생: %s", e)
        logger.debug(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# ──────────────── 5. MQ 전송 함수 ────────────────
def send_result_to_mq(result):
    try:
        logger.info(f"📦 MQ 전송 데이터: {result}")
        params = pika.URLParameters(MQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue=MQ_RESULT_QUEUE, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=MQ_RESULT_QUEUE,
            body=json.dumps(result),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logger.info("📤 MQ 전송 성공")
        connection.close()
    except Exception as e:
        logger.error("❌ MQ 전송 실패: %s", e)
        raise

# ──────────────── 6. 실행 ────────────────
if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=True)
