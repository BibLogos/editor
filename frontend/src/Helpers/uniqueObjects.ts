export const uniqueObject = (property: string) => function(value, index, self) {
    return self.indexOf(self.find(item => item[property] === value[property])) === index
}