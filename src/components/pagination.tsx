function Pagination() {
  return (
    <div className="pagination">
      <button>
        <img src="/icons/chevron-left.svg" alt="이전" />
      </button>

      <button className="active">1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <button>5</button>

      <button>
        <img src="/icons/chevron-right.svg" alt="다음" />
      </button>
    </div>
  );
}

export default Pagination;