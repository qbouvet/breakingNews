function sha384_js {
    wget "$1" \
        | openssl dgst -sha384 -binary \
        | printf "\n\nsha384-$(openssl base64 -A)\n\n"
}

sha384_js $1
