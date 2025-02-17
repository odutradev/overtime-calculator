import Main from "@pages/main";

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