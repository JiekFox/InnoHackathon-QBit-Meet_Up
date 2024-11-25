import { NavLink } from 'react-router-dom';

export default function SignUp() {
    return (
        <main className="main-content">
            <h1 className="sign-title">Sign Up</h1>
            <p className="sign-subtitle">Enter your data</p>
            <form className="sign-form">
                <div className="input-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" />
                </div>
                <div className="input-group">
                    <label htmlFor="surname">Surname</label>
                    <input type="text" id="surname" name="surname" />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" />
                </div>
                <button type="submit" className="sign-button">
                    Submit
                </button>
                <p>
                    Or you want to{' '}
                    <NavLink to="/sign-in" className="sign-in-link">
                        Sign In?
                    </NavLink>
                </p>
            </form>
        </main>
    );
}
