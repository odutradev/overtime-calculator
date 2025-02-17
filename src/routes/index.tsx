import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import routesPaths from "@routes/routes";

const Router = () => {
  const token = localStorage.getItem("token");

    return(
      <BrowserRouter>
        <Routes>     
            {
              routesPaths.map(({path, privateRoute, routes}) => {
                return routes.map(([itemPath, element]) => <Route path={path + itemPath} element={(privateRoute == true && token == null) ? <Navigate to="/signin" /> :  element}/>)
              })
            }
        </Routes>
      </BrowserRouter>
    );
};

export default Router