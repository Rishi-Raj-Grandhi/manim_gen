import os, mimetypes
import boto3
from urllib.parse import quote

# Load env variables
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET = os.getenv("S3_BUCKET")
S3_PUBLIC = os.getenv("S3_PUBLIC", "True").lower() == "true"
S3_PREFIX = os.getenv("S3_PREFIX", "").lstrip("/")
CDN_BASE_URL = os.getenv("CDN_BASE_URL", "").rstrip("/")

_session = boto3.session.Session(
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION,
)
_s3 = _session.client("s3")

def _key_for(filename: str) -> str:
    # Put everything under S3_PREFIX, keep filename
    return f"{S3_PREFIX}/{filename}".strip("/") if S3_PREFIX else filename

def upload_file(local_path: str, s3_filename: str | None = None) -> str:
    """
    Uploads local_path to S3. Returns a URL:
      - CDN_BASE_URL/key if set
      - S3 public URL if S3_PUBLIC=True
      - pre-signed URL if private
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET env not set")

    key = _key_for(s3_filename or os.path.basename(local_path))
    content_type, _ = mimetypes.guess_type(local_path)
    extra = {"ContentType": content_type or "video/mp4"}

    if S3_PUBLIC:
        extra["ACL"] = "public-read"
        extra["CacheControl"] = "public, max-age=31536000, immutable"

    _s3.upload_file(local_path, S3_BUCKET, key, ExtraArgs=extra)

    # Build URL preference: CDN > S3 public > pre-signed
    if CDN_BASE_URL:
        return f"{CDN_BASE_URL}/{quote(key)}"

    if S3_PUBLIC:
        region_host = f"s3.{AWS_REGION}.amazonaws.com" if AWS_REGION != "us-east-1" \
                      else "s3.amazonaws.com"
        return f"https://{S3_BUCKET}.{region_host}/{quote(key)}"

    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=604800,  # 1 hour
    )


def presign_key(key: str, expires: int = 3600) -> str:
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=expires,
    )
