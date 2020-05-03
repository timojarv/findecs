import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";

import {
    Flex,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Image,
    useToast,
} from "@chakra-ui/core";
import { Menu as Hamburger, X } from "react-feather";
import FindecsLogo from "../resources/logo.svg";
import { useMutation } from "urql";

const mutation = `
    mutation Logout {
        logout
    }
`;

const NavItem = (props) => (
    <Button variant="ghost" to={props.to} as={Link} mt={[1, 0]}>
        {props.children}
    </Button>
);

const Navigation = (props) => {
    const { user, setUser } = props;
    const path = props.location.pathname;

    const [open, setOpen] = useState(false);
    const [_, logout] = useMutation(mutation);
    const toast = useToast();

    const handleToggle = () => setOpen(!open);

    const handleLogout = () => {
        logout().then(() => {
            setUser(null);
            toast({
                position: "top",
                title: "Kirjauduttu ulos",
            });
        });
    };

    if (path.endsWith("print")) {
        return null;
    }

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            py={2}
            px={[3, 8]}
            borderBottom="1px"
            borderColor="gray.200"
            {...props}
        >
            <Flex align="center" mx={3}>
                <Image as={FindecsLogo} size={12} />
            </Flex>

            <Box
                cursor="pointer"
                display={["block", "none"]}
                onClick={handleToggle}
            >
                {open ? <X /> : <Hamburger />}
            </Box>

            <Box
                display={[open ? "flex" : "none", "flex"]}
                width={["full", "auto"]}
                alignItems="center"
                flexGrow={1}
                flexDirection={["column", "row"]}
            >
                <NavItem to="/costClaims">Kulukorvaukset</NavItem>
                <NavItem to="/purchaseInvoices">Ostolaskut</NavItem>
                <NavItem to="/salesInvoices">Myyntilaskut</NavItem>
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon="chevron-down"
                        mt={[1, 0]}
                    >
                        Hallinta
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/costPools">
                            Kustannuspaikat
                        </MenuItem>
                        <MenuItem as={Link} to="/contacts">
                            Yhteystiedot
                        </MenuItem>
                        <MenuItem as={Link} to="/users">
                            Käyttäjät
                        </MenuItem>
                        <MenuItem as={Link} to="/import">
                            Tuo tietoja
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Box margin="auto" display={[open ? "block" : "none", "flex"]}>
                <Menu>
                    <MenuButton
                        as={Button}
                        mt={[1, 0]}
                        variant="ghost"
                        rightIcon="chevron-down"
                    >
                        {user.name}
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/settings">
                            Asetukset
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            Kirjaudu ulos
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default Navigation;
