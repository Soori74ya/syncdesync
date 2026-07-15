const channelSlug = "sync-de-sync-8ksoerh4bry";
const gallery = document.querySelector(".image-gallery");

async function loadArenaImages() {
  if (!gallery) {
    console.error(".image-gallery 요소를 찾을 수 없습니다.");
    return;
  }

  gallery.innerHTML = '<p class="loading">Loading...</p>';

  try {
    const apiUrl =
      `https://api.are.na/v2/channels/${channelSlug}/contents?page=1&per=100`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Are.na API 오류: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    const blocks = Array.isArray(result)
      ? result
      : result.contents || result.data || [];

    /*
      이미지 블록만 골라낸 뒤,
      가장 최근에 추가된 블록부터 정렬
    */
    const imageBlocks = blocks
      .filter((block) => {
        return (
          block.image?.original?.url ||
          block.image?.display?.url ||
          block.image?.large?.url ||
          block.image?.thumb?.url
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();

        return dateB - dateA;
      });

    gallery.innerHTML = "";

    imageBlocks.forEach((block) => {
      const imageUrl =
        block.image?.original?.url ||
        block.image?.display?.url ||
        block.image?.large?.url ||
        block.image?.thumb?.url;

      const image = document.createElement("img");

      image.src = imageUrl;
      image.alt =
        block.title ||
        block.generated_title ||
        "Are.na channel image";

      image.loading = "lazy";
      image.decoding = "async";

      image.addEventListener("error", () => {
        console.warn("이미지 로드 실패:", imageUrl);
        image.remove();
      });

      gallery.appendChild(image);
    });

    if (imageBlocks.length === 0) {
      gallery.innerHTML =
        '<p class="error">채널에 이미지가 없습니다.</p>';
    }

    console.log(
      `${imageBlocks.length}개의 이미지를 최신순으로 불러왔습니다.`
    );
  } catch (error) {
    console.error("Are.na 이미지를 불러오지 못했습니다.", error);

    gallery.innerHTML = `
      <p class="error">
        이미지를 불러오지 못했습니다.
      </p>
    `;
  }
}

loadArenaImages();