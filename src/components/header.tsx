function Header() {
  return (
    <header className="header">
      <h1>UMCine</h1>

      <nav>
        <a href="#">영화</a>
        <a href="#">시리즈</a>
        <a href="#">찜</a>
      </nav>

      <div className="header-icons">
        <img src="/icons/search.svg" alt="검색" />
        <img src="/icons/person.svg" alt="프로필" />
      </div>
    </header>
  );
}

export default Header;