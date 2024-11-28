import logo from '../assets/img/handle_color_white.png';
export default function Loader() {
    return (
        <div className="loader">
            <img src={logo} alt="Loading..." className="loader-logo" />
        </div>
    );
}
