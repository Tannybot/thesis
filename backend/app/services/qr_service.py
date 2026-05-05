"""
QR Code service — generates QR codes with embedded private animal URLs.
Uses the 'qrcode' library to create PNG images.
"""
import os
from urllib.parse import urlparse
import qrcode
from app.config import settings

# Ensure QR codes directory exists
QR_CODE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "qr_codes")
os.makedirs(QR_CODE_DIR, exist_ok=True)


def _is_local_url(url: str) -> bool:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    return hostname in {"localhost", "127.0.0.1", "0.0.0.0"} or hostname.endswith(".local")


def get_private_qr_base_url() -> str:
    """Return the deployed protected animal QR route."""
    configured = settings.QR_CODE_BASE_URL.rstrip("/")
    if configured and not _is_local_url(configured):
        return configured

    frontend = settings.FRONTEND_URL.rstrip("/")
    if frontend and not _is_local_url(frontend):
        return f"{frontend}/animals/qr"

    return "https://livetrack.com/animals/qr"


def build_private_animal_qr_url(animal_uid: str) -> str:
    """Build the private app URL encoded inside the QR image."""
    return f"{get_private_qr_base_url()}/{animal_uid}"


def generate_qr_code(animal_uid: str, animal=None) -> tuple[str, str]:
    """
    Generate a QR code image for an animal.
    Returns (private_animal_url, file_path).
    """
    qr_data = build_private_animal_qr_url(animal_uid)

    # Create QR code image
    qr = qrcode.QRCode(
        version=None,
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
