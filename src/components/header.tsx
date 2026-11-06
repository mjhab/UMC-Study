import { useState } from "react";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // 엔터를 치면 입력한 검색어를 가지고 검색 페이지로 이동
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <header className="header">
      <h1>UMCine</h1>
      
      <nav>
        <a href="#">영화</a>
        <a href="#">시리즈</a>
        <a href="#">찜</a>
      </nav>

      {/* 검색어를 입력할 수 있는 폼 추가 */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="text"
          placeholder="영화를 검색해보세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }}>
          🔍
        </button>
      </form>

      <div className="header-icons">
        <img src="/icons/person.svg" alt="프로필" />
      </div>
    </header>
  );
}

export default Header;