DIRECTORY=${1:-.}

replace_text() {
    # Rename files and directories
    find "$1" -depth -name "*post*" | while read -r f; do
        new_name=$(echo "${f}" | sed 's/post/app/g')
        mv "$f" "$new_name"
    done

    # # Replace text inside files
    # find "$1" -type f | while read -r file; do
    #     if grep -q 'Post' "$file"; then
    #         sed -i 's/Post/App/g' "$file"
    #     fi
    # done
}

replace_text "$DIRECTORY"
echo "Replacement completed!"