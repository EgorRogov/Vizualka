import React, { useEffect, useState } from "react";
import { BookCard } from "./bookCard";

type Book = {
  id: number;
  title: string;
  isbn: string;
  authors: string[];
};

export const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("https://fakeapi.extendsclass.com/books")
      .then((res) => res.json())
      .then((data: Book[]) => {
        setBooks(data);
        loadImages(data);
      });
  }, []);

  const loadImages = async (books: Book[]) => {
    const newImages: Record<number, string> = {};

    for (const book of books) {
      if (book.isbn) {
        const isbn = book.isbn.replace(/-/g, '');
        newImages[book.id] = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
      } else {
        newImages[book.id] = "/placeholder.png";
      }
    }

    setImages(newImages);
  };

  return (
    <div style={styles.container}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          authors={book.authors}
          imageUrl={images[book.id] || "/placeholder.png"}
        />
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "20px",
  },
};