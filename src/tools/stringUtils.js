const createSearchPattern = (originalString) => {
    if (!originalString) {
        return originalString;
    }
    return originalString.trim().toLowerCase();
}

export{
    createSearchPattern
}