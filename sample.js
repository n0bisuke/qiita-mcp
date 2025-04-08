async function fetchQiitaArticles(query) {
    try {
      const response = await fetch(`https://qiita.com/api/v2/items?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // もしAPIトークンが必要な場合は、以下の行のコメントを外して、実際のトークンを入力してください
          'Authorization': 'Bearer a255792cf9f7dd8d3a92fc4f088a86630d2786c1'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const articles = await response.json();
      console.log('Qiita Articles:', articles);
      return articles;
    } catch (error) {
      console.error('Error fetching Qiita articles:', error);
    }
  }
  
  // 使用例
  export default fetchQiitaArticles;
  
  // スクリプトとして実行する場合
  if (import.meta.url === `file://${process.argv[1]}`) {
    fetchQiitaArticles('JavaScript');
  }