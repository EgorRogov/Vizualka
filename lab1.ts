 interface User{
    id: number;
    name: string;
    email?: string;
    isActive?: boolean;
}

 function createUser(id: number, name: string, email?: string,isActive: boolean = true ): User {
    return {
        id,
        name,
        email,
        isActive
    };
}

 type Genre = 'fiction'| 'non-fiction';

 interface Book{
    title: string;
    author: string;
    year?: number;
    genre: Genre;
}

 function createBook(book: Book): Book {
    return book;
}

 function calculateArea(shape: 'circle', radius: number): number;
 function calculateArea(shape: 'square', side: number): number;

 function calculateArea(shape: 'circle' | 'square',value: number): number{
    switch(shape){
        case 'circle':
            return Math.PI * value * value;
        case 'square':
            return value * value;
    }   
}

 type Status = 'active'| 'inactive'| 'new';

 function getStatusColor(status : Status): string{
    switch(status){
        case 'active':
            return 'green';
        case 'inactive':
            return 'red';
        case 'new':
            return 'blue';
    }
}

 type StringFormatter = (str: string, uppercase?: boolean) => string;

 const firstLetter: StringFormatter = (input: string, uppercase: boolean = false): string => {
    if (!input || input.length === 0) return input;

    let result = input;
    if (uppercase) result = result.toUpperCase();

    return result.charAt(0).toUpperCase() + result.slice(1);
};

 const trimUppercase: StringFormatter = (input: string, uppercase: boolean = false): string => {
    let result = input.trim();
    if (uppercase) result = result.toUpperCase();
    return result;
};

 function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

interface HasId {
    id: number;
}

 function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}


// const user1 = createUser(1, "Егор Рогов", "pochta@example.com");
// console.log(user1);

// const book1: Book = createBook({
//     title: "Мастер и Маргарита",
//     author: "Михаил Булгаков",
//     year: 1966,
//     genre: 'fiction' 
// });

// console.log('Книга 1 (с годом):');
// console.log(book1);
// console.log('Тип жанра:', typeof book1.genre);


// const circleArea = calculateArea('circle', 10); // 314.15...
// const squareArea = calculateArea('square', 10); // 100

// console.log(`Круг: ${circleArea.toFixed(2)}, Квадрат: ${squareArea}`);


// console.log('Color for active:', getStatusColor('active')); 

// const numbers = [10, 20, 30];
// const strings = ["TypeScript", "JavaScript"];
// const empty: number[] = [];

// console.log('First number:', getFirstElement(numbers)); 
// console.log('First string:', getFirstElement(strings)); 
// console.log('Empty array:', getFirstElement(empty));  

// const usersList = [
//     { id: 1, name: "Ivan" },
//     { id: 5, name: "Maria" }
// ];

// const found = findById(usersList, 5);
// console.log('Found by ID 5:', found?.name); 

// const notFound = findById(usersList, 99);
// console.log('Not found:', notFound); 
// argusvan@MacBook-Air-Egor Vizual % tsc lab1.ts --target ES2020
// argusvan@MacBook-Air-Egor Vizual % node lab1.js 