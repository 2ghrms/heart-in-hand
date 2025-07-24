import requests
import json
import base64
import os
import logging
import sys
from dotenv import load_dotenv

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)


def _detect_image_format(image_base64: str) -> str:
    """Base64 문자열에서 이미지 포맷(jpg·png·gif 등)을 추정해 반환한다.
    data URI 스킴이 붙은 경우와 순수 base64만 전달된 경우 모두 지원한다."""
    try:
        header, _, data = image_base64.partition(',')
        b64data = data if header.startswith('data:') else image_base64

        # imghdr는 헤더 정보로만 판단하므로 처음 몇 KB만 디코드해도 충분
        decoded = base64.b64decode(b64data[:8192])
        fmt = imghdr.what(None, decoded)
        if fmt == 'jpeg':
            fmt = 'jpg'
        return fmt or 'png'   # 판단 실패 시 기본값
    except Exception:
        return 'png'

def analyze_image_base64(image_base64, file_name=None, note_image_id=None):
    try:
        ts = int(time.time() * 1000)
        img_format = _detect_image_format(image_base64)

        logging.info(f"분석 시작 - noteImageId: {note_image_id}, file: {file_name}, format: {img_format}")

        if not API_URL or not SECRET_KEY:
            raise ValueError("NAVER_OCR_API_URL 또는 NAVER_OCR_SECRET_KEY가 비어 있습니다.")

        headers = {
            "Content-Type": "application/json",
            "X-OCR-SECRET": SECRET_KEY
        }

        body = {
            "version": "V2",
            "requestId": str(note_image_id),
            "timestamp": ts,
            "images": [
                {
                    "format": img_format,
                    "name": file_name or "image",
                    "data": image_base64
                }
            ]
        }

        resp = requests.post(API_URL, headers=headers, data=json.dumps(body))
        logging.info(f"OCR 응답 상태 코드: {resp.status_code}")

        resp_json = resp.json()
        logging.debug(f"OCR 응답 본문: {json.dumps(resp_json, ensure_ascii=False)}")

        if resp.status_code != 200 or "images" not in resp_json:
            return {
                "noteImageId": note_image_id,
                "status": "error",
                "message": resp_json.get("message", "Unknown error")
            }

        recognized = " ".join(
            field["inferText"]
            for image in resp_json["images"]
            for field in image.get("fields", [])
        ).strip()

        return {
            "noteImageId": note_image_id,
            "recognizedText": recognized or f"noteImageId:{note_image_id}에서 텍스트를 감지하지 못했습니다."
        }

    except Exception as e:
        logging.error(f"분석 에러 발생: {str(e)}")
        return {
            "noteImageId": note_image_id,
            "recognizedText": None,
            "status": "error",
            "message": str(e)
        }