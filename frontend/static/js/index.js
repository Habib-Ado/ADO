import Home from "./views/Home.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Product from "./views/Product.js";
import Cart from "./views/Cart.js";
import Dashboard from "./views/Dashboard.js";
import Profile from "./views/Profile.js";
import Order from "./views/Order.js";
import AdminDashboard from "./views/AdminDashboard.js";
import VerifyEmail from "./views/VerifyEmail.js";
import Messages from "./views/Messages.js";
import ArtisanRequest from "./views/ArtisanRequest.js";
import AdminArtisanRequests from "./views/AdminArtisanRequests.js";
import AdminUserManagement from "./views/AdminUserManagement.js";

const navigateTo = path => {
    history.pushState(null, null, path)
    router().then(_ => console.log)
}

const router = async () => {
    const routes = [
        {
            path: "/",
            view: Home
        },
        {
            path: "/login",
            view: Login
        },
        {
            path: "/register",
            view: Register
        },
        {
            path: "/prodotti",
            view: Product
        },
        {
            path: "/cart",
            view: Cart
        },
        {
            path: "/dashboard",
            view: Dashboard
        },
        {
            path: "/profile",
            view: Profile
        },
        {
            path: "/order",
            view: Order
        },
        {
            path: "/admin",
            view: AdminDashboard
        },
        {
            path: "/verify-email",
            view: VerifyEmail
        },
        {
            path: "/messages",
            view: Messages
        },
        {
            path: "/artisan-request",
            view: ArtisanRequest
        },
        {
            path: "/admin/artisan-requests",
            view: AdminArtisanRequests
        },
        {
            path: "/admin/users",
            view: AdminUserManagement
        }
    ]

    // Testare ogni route per un potenziale match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        }
    })

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        }
    }

    const view = new match.route.view()

    document.querySelector("#app").innerHTML = await view.getHtml()
    
    // Inizializza la view se ha un metodo init
    if (view.init) {
        await view.init();
    }
    
    // Inizializza la view se ha un metodo onMounted (per compatibilità con le versioni precedenti)
    if (view.onMounted) {
        await view.onMounted();
    }
    
    // Inizializza la view se ha un metodo afterRender
    if (view.afterRender) {
        await view.afterRender();
    }
}

window.addEventListener("popstate", () => router)

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            navigateTo(e.target.href)
        }
    })

    router().then(_ => console.log)
})