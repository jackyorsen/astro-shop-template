import React, { useEffect } from 'react';

interface Review {
    author: string;
    rating: number;
    title: string;
    content: string;
    date: string;
    verified: boolean;
}

interface ProductSchemaProps {
    productName: string;
    productSku: string;
    productDescription: string;
    productPrice: number;
    productImage: string;
    reviews?: Review[];
    productUrl: string;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
    productName,
    productSku,
    productDescription,
    productPrice,
    productImage,
    reviews = [],
    productUrl
}) => {

    useEffect(() => {
        // Berechne durchschnittliche Bewertung
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        // Erstelle Schema.org Product mit AggregateRating und Reviews
        const productSchema: any = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": productName,
            "image": productImage,
            "description": productDescription,
            "sku": productSku,
            "brand": {
                "@type": "Brand",
                "name": "Songmics"
            },
            "offers": {
                "@type": "Offer",
                "url": productUrl,
                "priceCurrency": "EUR",
                "price": productPrice.toFixed(2),
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": "Mamoru Möbel"
                }
            }
        };

        // Füge Aggregate Rating hinzu (falls Reviews vorhanden)
        if (reviews.length > 0) {
            productSchema["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": averageRating.toFixed(1),
                "reviewCount": reviews.length.toString(),
                "bestRating": "5",
                "worstRating": "1"
            };

            // Füge individuelle Reviews hinzu
            productSchema["review"] = reviews.slice(0, 5).map(review => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": review.author
                },
                "datePublished": review.date,
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": review.rating.toString(),
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "reviewBody": review.content,
                "name": review.title
            }));
        }

        // Erstelle oder aktualisiere script tag
        const existingScript = document.getElementById('product-schema');
        if (existingScript) {
            existingScript.textContent = JSON.stringify(productSchema);
        } else {
            const script = document.createElement('script');
            script.id = 'product-schema';
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(productSchema);
            document.head.appendChild(script);
        }

        // Cleanup
        return () => {
            const script = document.getElementById('product-schema');
            if (script) {
                script.remove();
            }
        };
    }, [productName, productSku, productDescription, productPrice, productImage, reviews, productUrl]);

    return null;
};
