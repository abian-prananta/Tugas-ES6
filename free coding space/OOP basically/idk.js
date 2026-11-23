function Kitty(name, age, color) {
    this.name = name;
    this.age = age;
    this.color = color;
}

Kitty.prototype.drink = function() {
    console.log(this.kitty + " is drinking milk.");
}

kitty.prototype.sleep = function() {
    console.log(this.kitty + " is sleeping.");
}

