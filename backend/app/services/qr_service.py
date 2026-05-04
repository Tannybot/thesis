"""
QR Code service — generates QR codes with embedded animal URLs.
Uses the 'qrcode' library to create PNG images.
"""
import os
import qrcode
from app.config import settings

# Ensure QR codes directory exists
QR_CODE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "qr_codes")
os.makedirs(QR_CODE_DIR, exist_ok=True)


def generate_qr_code(animal_uid: str) -> tuple[str, str]:
    """
    Generate a QR code image for an animal.
    Returns (qr_data_url, file_path).
    """
    # The QR code encodes a URL to the animal's profile
    qr_data = f"{settings.QR_CODE_BASE_URL}/{animal_uid}"

    # Create QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1a1a2e", back_color="white")

    # Save to file
    filename = f"qr_{animal_uid}.png"
    filepath = os.path.join(QR_CODE_DIR, filename)
    img.save(filepath)

    return qr_data, filepath


def get_qr_code_filepath(animal_uid: str) -> str:
    """Build the canonical QR code file path for an animal UID."""
    filename = f"qr_{animal_uid}.png"
    return os.path.join(QR_CODE_DIR, filename)


def resolve_qr_code_path(animal_uid: str, stored_path: str | None = None) -> str | None:
    """
    Resolve a QR image path even if the stored DB path points to a different machine.
    """
    if stored_path and os.path.exists(stored_path):
        return stored_path

    filepath = get_qr_code_filepath(animal_uid)
    if os.path.exists(filepath):
        return filepath

    return None


def get_qr_code_path(animal_uid: str) -> str | None:
    """Get the file path for an existing QR code."""
    return resolve_qr_code_path(animal_uid)
