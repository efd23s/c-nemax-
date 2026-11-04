import os
import sys
import json
import base64
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO_NAME = "cinestream-pro"
REPO_DESC = "CineStream+ Pro - Gelismis Dizi ve Film Izleme Web Sitesi"

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

FILES_TO_UPLOAD = [
    "index.html",
    "series.html",
    "movies.html",
    "watch.html",
    "categories.html",
    "watchlist.html",
    "profile.html",
    "data.js",
    "auth.js",
    "navbar.js",
    "home.js",
    "watch.js",
    "style.css",
    "logo.png",
    "server.js",
    "server.py",
    "start.bat",
    "README.md",
    ".gitignore"
]

def make_request(url, method="GET", data=None, token=""):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CineStream-Deployer",
        "Authorization": f"token {token}"
    }
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    token = TOKEN
    if len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("HATA: Lutfen GitHub Personal Access Token (PAT) girin!")
        print("Kullanim: python deploy_to_github.py <GITHUB_TOKEN>")
        sys.exit(1)

    print("1. GitHub kullanici bilgileri dogrulaniyor...")
    try:
        user_info = make_request("https://api.github.com/user", token=token)
        username = user_info.get("login")
        print(f"   -> Kullanici: {username}")
    except Exception as e:
        print(f"HATA: Token gecersiz veya yetersiz: {e}")
        sys.exit(1)

    print(f"2. '{REPO_NAME}' deposu kontrol ediliyor...")
    repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
    try:
        make_request(repo_url, token=token)
        print("   -> Depo zaten mevcut, dosyalar guncellenecek.")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("   -> Depo olusturuluyor...")
            make_request("https://api.github.com/user/repos", method="POST", data={
                "name": REPO_NAME,
                "description": REPO_DESC,
                "private": False,
                "auto_init": False
            }, token=token)
            print("   -> Depo basariyla olusturuldu!")
        else:
            print(f"HATA: {e}")
            sys.exit(1)

    print("3. Dosyalar GitHub'a yukleniyor...")
    for filename in FILES_TO_UPLOAD:
        filepath = os.path.join(PROJECT_DIR, filename)
        if not os.path.exists(filepath):
            print(f"   [!] Atlaniyor (bulunamadi): {filename}")
            continue

        with open(filepath, "rb") as f:
            content_b64 = base64.b64encode(f.read()).decode("utf-8")

        # Check existing file sha if exists
        content_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/contents/{filename}"
        sha = None
        try:
            existing = make_request(content_url, token=token)
            sha = existing.get("sha")
        except urllib.error.HTTPError:
            pass

        payload = {
            "message": f"Add/Update {filename}",
            "content": content_b64
        }
        if sha:
            payload["sha"] = sha

        try:
            make_request(content_url, method="PUT", data=payload, token=token)
            print(f"   [✓] Yuklendi: {filename}")
        except Exception as e:
            print(f"   [X] Yuklenemedi {filename}: {e}")

    print("\n=======================================================")
    print("TEBRIKLER! Proje GitHub'da basariyla yayinlandi!")
    print(f"Depo Linki: https://github.com/{username}/{REPO_NAME}")
    print("=======================================================")

if __name__ == "__main__":
    main()
