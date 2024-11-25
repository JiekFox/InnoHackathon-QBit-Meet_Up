export default function Pagination() {
    return (
        <nav className="pagination">
            <a href="#" className="prev">
                « Previous
            </a>
            {[1, 2, 3, '...', 67].map((item, index) => (
                <a href="#" className="page-number" key={index}>
                    {item}
                </a>
            ))}
            <a href="#" className="next">
                Next »
            </a>
        </nav>
    );
}
