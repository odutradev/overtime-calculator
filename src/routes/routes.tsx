import Main from "page/index";

const routes = [
    {
        path: "/",
        privateRoute: false,
        routes: [
            ['/', <Main />],
        ]
    },
];

export default routes;