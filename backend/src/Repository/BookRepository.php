<?php

namespace App\Repository;

use App\Entity\Book;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Book>
 */
class BookRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Book::class);
    }

    /**
     * Devuelve la lista de libros con su promedio de rating
     * calculado directamente en la base de datos.
     *
     * @return array<int, array{
     *     title: string,
     *     author: string,
     *     published_year: int,
     *     average_rating: string|null
     * }>
     */
    public function findBooksWithAverageRating(): array
    {
        return $this->createQueryBuilder('b')
            ->select('
                b.title,
                b.author,
                b.publishedYear AS published_year,
                AVG(r.rating) AS average_rating
            ')
            ->leftJoin('b.reviews', 'r')
            ->groupBy('b.id')
            ->getQuery()
            ->getArrayResult();
    }
}
