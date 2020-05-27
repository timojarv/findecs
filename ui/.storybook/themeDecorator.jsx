import React from "react";

import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import theme from "../src/util/theme";

const ThemeDecorator = (story) => (
    <ThemeProvider theme={theme}>
        <CSSReset />
        {story()}
    </ThemeProvider>
);

export default ThemeDecorator;
