import React from "react";
import { PseudoBox } from "@chakra-ui/core";
import { Upload } from "react-feather";
import { useDropzone } from "react-dropzone";

const FileInput = ({ onChange, isDisabled, accept, ...props }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDropAccepted: onChange,
        disabled: isDisabled,
        accept: accept,
    });
    return (
        <PseudoBox
            as="label"
            rounded="lg"
            border="2px dashed"
            display="flex"
            alignItems="center"
            justifyContent="space-around"
            p={6}
            flexDirection="column"
            overflow="hidden"
            color="indigo.300"
            borderColor="indigo.200"
            _hover={{ color: "indigo.500", borderColor: "indigo.500" }}
            cursor="pointer"
            {...getRootProps()}
            onClick={() => {}}
            {...props}
        >
            <Upload style={{ marginBottom: 8 }} />
            Raahaa tiedostot tähän tai klikkaa
            <input {...getInputProps()} />
        </PseudoBox>
    );
};

export default FileInput;
