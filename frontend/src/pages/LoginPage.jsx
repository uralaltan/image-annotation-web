const LoginPage = () => {
    return (
        
        <div className={"login"}>
            <div className={"container-fluid"}>
                <div className={"row justify-content-center align-items-center h-100"}>
                    <div className={"col-12"}>
                        <div className={"card bg-dark text-white my-5 mx-auto"} style={{borderRadius: "1rem", maxWidth: "400px"}}>
                            <div className={"card-body p-5 d-flex flex-column align-items-center mx-auto w-100"}>
                                <h2 className={"fw-bold mb-4"}> Member Login </h2>
                                <input className={"form-control mb-4 mx-5 w-100"} placeholder={"User ID"} type={"text"}/>
                                <input className={"form-control mb-4 mx-5 w-100"} placeholder={"Password"} type={"password"}/>
                                <button className={"btn btn-outline-light mx-2 px-5"}> Login </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
}

export default LoginPage;