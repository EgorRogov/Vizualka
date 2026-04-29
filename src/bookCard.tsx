import React from "react";

type BookCardProps = {
  title: string;
  authors: string[];
  imageUrl: string;
};

export const BookCard: React.FC<BookCardProps> = ({
  title,
  authors,
  imageUrl,
}) => {
  return (
    <div style={styles.card}>
      <img src={imageUrl} style={styles.image} />
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.authors}>{authors.join(", ")}</p>
    </div>
  );
};

const styles = {
  card: {
    width: "200px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center" as const,
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "cover" as const,
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  authors: {
    fontSize: "14px",
    color: "gray",
  },
};