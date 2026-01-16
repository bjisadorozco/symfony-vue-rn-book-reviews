<?php

namespace App\Entity;

use App\Repository\ReviewRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Range(min: 1, max: 5)]
    private ?int $rating = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    private ?string $comment = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Book $book = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable('now', new \DateTimeZone('America/Bogota'));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = $rating;
        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(string $comment): static
    {
        $this->comment = $comment;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getBook(): ?Book
    {
        return $this->book;
    }

    public function setBook(?Book $book): static
    {
        $this->book = $book;
        return $this;
    }

    
    public function getCreatedAtColombianFormat(): string
    {
        if (!$this->createdAt) {
            return '';
        }
        
        $date = $this->createdAt->setTimezone(new \DateTimeZone('America/Bogota'));
        
        return $date->format('d/m/Y H:i:s');
    }


    public function getCreatedAtIsoFormat(): string
    {
        if (!$this->createdAt) {
            return '';
        }

        $date = $this->createdAt->setTimezone(new \DateTimeZone('America/Bogota'));
        
        return $date->format('c');
    }

    public function getCreatedAtFriendlyFormat(): string
    {
        if (!$this->createdAt) {
            return '';
        }
        
        $date = $this->createdAt->setTimezone(new \DateTimeZone('America/Bogota'));
        
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        
        $dia = $date->format('d');
        $mes = $meses[(int)$date->format('m')];
        $anio = $date->format('Y');
        $hora = $date->format('H:i');
        
        return "$dia de $mes de $anio, $hora";
    }

    public function getCreatedAtDateOnly(): string
    {
        if (!$this->createdAt) {
            return '';
        }
        
        $date = $this->createdAt->setTimezone(new \DateTimeZone('America/Bogota'));
        return $date->format('d/m/Y');
    }

    public function getCreatedAtTimeOnly(): string
    {
        if (!$this->createdAt) {
            return '';
        }
        
        $date = $this->createdAt->setTimezone(new \DateTimeZone('America/Bogota'));
        return $date->format('H:i:s');
    }
}