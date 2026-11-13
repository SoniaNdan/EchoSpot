<?php

namespace App\Services\AI;

use RuntimeException;

class AIQuotaExceededException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The current subscription period AI token allowance has been reached.');
    }
}
