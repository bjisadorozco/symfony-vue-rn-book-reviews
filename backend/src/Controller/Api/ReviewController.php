<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Repository\BookRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reviews')]
class ReviewController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        BookRepository $bookRepository,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        // Validar book
        $book = $bookRepository->find($data['book_id'] ?? null);
        if (!$book) {
            return $this->json(['error' => 'Book not found'], 400);
        }

        $review = new Review();
        $review
            ->setBook($book)
            ->setRating((int) ($data['rating'] ?? 0))
            ->setComment(trim($data['comment'] ?? ''));

        // Validaciones con Symfony Validator
        $errors = $validator->validate($review);

        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()][] = $error->getMessage();
            }

            return $this->json(['errors' => $messages], 400);
        }

        $em->persist($review);
        $em->flush();

        return $this->json([
            'id' => $review->getId(),
            'created_at' => $review->getCreatedAtColombianFormat()
        ], 201);
    }
}