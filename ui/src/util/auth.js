import React from "react";

/*
Auth schema
{
    id,
    name,
    email,
    token,
    setToken(token)
}
*/

const defaultUser = {
    setToken: () => {},
};

export const AuthContext = React.createContext(defaultUser);

export const tokenStorage = {
    _key: "findecsAccessToken",
    get: () => localStorage.getItem(tokenStorage._key),
    set: (token) => localStorage.setItem(tokenStorage._key, token),
    clear: () => localStorage.removeItem(tokenStorage._key),
};
