<?php

namespace App\DataFixtures;

use App\Entity\Book;
use App\Entity\Review;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class BookReviewFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $book1 = (new Book())
            ->setTitle('El Arte de Programar')
            ->setAuthor('Donald Knuth')
            ->setPublishedYear(1968);

        $book2 = (new Book())
            ->setTitle('Clean Code')
            ->setAuthor('Robert C. Martin')
            ->setPublishedYear(2008);

        $book3 = (new Book())
            ->setTitle('Refactoring')
            ->setAuthor('Martin Fowler')
            ->setPublishedYear(1999);

        $manager->persist($book1);
        $manager->persist($book2);
        $manager->persist($book3);

        $reviews = [
            [$book1, 5, 'Excelente libro'],
            [$book1, 4, 'Muy completo'],
            [$book2, 5, 'Imprescindible'],
            [$book2, 4, 'Buenas prácticas claras'],
            [$book3, 3, 'Buen contenido'],
            [$book3, 4, 'Muy útil']
        ];

        foreach ($reviews as [$book, $rating, $comment]) {
            $review = (new Review())
                ->setBook($book)
                ->setRating($rating)
                ->setComment($comment);

            $manager->persist($review);
        }

        $manager->flush();
    }
}
