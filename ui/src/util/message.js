import { useToast } from "@chakra-ui/core";
import { useMemo } from "react";

export const useMessage = () => {
    const toast = useToast();

    return useMemo(
        () => ({
            errorMessage: (msg, asTitle) =>
                toast({
                    title: asTitle ? msg : "Tapahtui virhe",
                    status: "error",
                    position: "top",
                    description: asTitle ? undefined : msg,
                }),
            successMessage: (msg) =>
                toast({
                    status: "success",
                    position: "top",
                    title: msg,
                }),
            infoMessage: (msg) =>
                toast({
                    position: "top",
                    title: msg,
                }),
        }),
        [toast]
    );
};
