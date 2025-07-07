export interface Product{
id:number;
name:string;
price:number;
discount:number;
description:string;
images: string[]; // use for multiple images uploads
}

export interface ProductCategory{
    id:string;
    name:string;
    products:Product[];
}