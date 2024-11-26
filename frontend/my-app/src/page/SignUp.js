import { NavLink } from 'react-router-dom';
import { SIGN_IN } from "../constant/router";

export default function SignUp() {
    return (
        <main className="main-content">
            <h1 className="sign-title">Sign Up</h1>

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
                    Already registered?{' '}
                    <NavLink to={SIGN_IN} className="sign-in-link">
                        Sign in.
                    </NavLink>
                </p>
            </form>
        </main>
    );
}