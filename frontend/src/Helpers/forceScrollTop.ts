export const forceScrollTop = async (element: any, scrollTop: number) => {
    const tryApply = () => {
        if (element.scrollTop !== scrollTop) {
            element.scrollTop = scrollTop
        }
    }

    tryApply()

    if (element.scrollTop !== scrollTop) {
        setTimeout(() => forceScrollTop(element, scrollTop), 100)
    }
}