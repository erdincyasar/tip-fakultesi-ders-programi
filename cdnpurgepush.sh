#!/bin/bash
# -------------------------------------------------------------
# cdnpurge.sh
# Google jsDelivr CDN önbelleğini temizler ve versiyon yönetimi yapar
# -------------------------------------------------------------

# Repo bilgisi
REPO="erdincyasar/tip-fakultesi-ders-programi"

# Güncellenecek JS dosyaları - Versiyon: 3
FILES=(
  "js/sw.js"
  "js/config.js"
  "js/utils.js"
  "js/calendar.js"
  "js/modal.js"
  "js/search.js"
  "js/pwa.js"
  "js/app.js"
)

# -------------------------------
# 1️⃣ Versiyon İşlemleri
# -------------------------------
echo "📦 Versiyon güncelleniyor..."

if [ ! -f version.json ]; then
  echo '{"version": 1, "updated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > version.json
else
  # jq komutu yoksa uyar
  if ! command -v jq &> /dev/null; then
    echo "❌ 'jq' yüklü değil. Lütfen yükleyin: sudo apt install jq"
    exit 1
  fi

  ver=$(jq '.version' version.json)
  next=$((ver + 1))
  jq --arg time "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --argjson v $next \
     '.version=$v | .updated=$time' version.json > tmp.$$.json && mv tmp.$$.json version.json
fi

echo "✅ Yeni versiyon: $(jq -r '.version' version.json)"
echo "🕒 Güncellendi: $(jq -r '.updated' version.json)"

# -------------------------------
# 2️⃣ Script Güncellemesi
# -------------------------------
echo ""
echo "📝 Script versiyonunu güncelleniyor..."
VERSION=$(jq -r '.version' version.json)
sed -i "s/# Güncellenecek JS dosyaları - Versiyon: 3[0-9]*/# Güncellenecek JS dosyaları - Versiyon: $VERSION/" cdnpurgepush.sh

# -------------------------------
# 3️⃣ Git İşlemleri
# -------------------------------
echo ""
echo "📝 Commit mesajını gir:"
read -r commit_msg

git add .
git commit -m "$commit_msg"
git push

# -------------------------------
# 4️⃣ jsDelivr Cache Temizleme
# -------------------------------
echo ""
echo "🚀 jsDelivr önbellek temizleme başlıyor..."
for FILE in "${FILES[@]}"; do
  URL="https://purge.jsdelivr.net/gh/${REPO}/${FILE}"
  echo "🔄 Yenileniyor: $FILE"
  curl -s -X GET "$URL" > /dev/null
  sleep 1
done

echo ""
echo "✅ İşlem tamamlandı."
echo "📦 Sürüm: $(jq -r '.version' version.json)"
