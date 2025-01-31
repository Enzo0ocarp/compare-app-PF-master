import React, { useEffect, useState } from "react";
import axios from "../backend/services/api";
import { Card } from "primereact/card";

const ProductList = ({ onSelectProduct }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/products").then(response => setProducts(response.data));
  }, []);

  return (
    <div>
      {products.map(product => (
        <Card key={product.id} title={product.name} onClick={() => onSelectProduct(product)}>
          <p>{product.description}</p>
        </Card>
      ))}
    </div>
  );
};

export default ProductList;
