<?php

namespace App\Controller\Api;

use App\Repository\BookRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/books')]
class BookController extends AbstractController
{
    #[Route('', name: 'api_books_list', methods: ['GET'])]
    public function index(BookRepository $bookRepository): JsonResponse
    {
        $books = $bookRepository->findBooksWithAverageRating();

        return $this->json($books);
    }
}
