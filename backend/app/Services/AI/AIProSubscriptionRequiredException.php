<?php

namespace App\Services\AI;

use RuntimeException;

class AIProSubscriptionRequiredException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('An active Pro subscription is required to use EchoSpot AI.');
    }
}
