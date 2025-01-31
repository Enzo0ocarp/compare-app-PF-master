import React, { useEffect, useState } from "react";
import axios from "../backend/services/api";

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`/reviews/${productId}`).then(response => setReviews(response.data));
  }, [productId]);

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>
          <p><strong>{review.username}:</strong> {review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
