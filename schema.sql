-- Dispute-Desk Database Schema
-- Run this in the Supabase SQL editor to set up all required tables.

-- Real Razorpay dispute reason codes and their required evidence,
-- sourced from Razorpay's published dispute documentation.
create table reason_code_config (
    id uuid primary key default gen_random_uuid(),
    network text not null,
    reason_code text not null,
    title text not null,
    description text not null,
    suggested_evidence text[] not null,
    created_at timestamp default now(),
    unique(network, reason_code)
);

-- Decision thresholds used by the Decision Engine.
-- Kept as data, not hardcoded, so policy can be tuned without a redeploy.
create table decision_policy (
    id uuid primary key default gen_random_uuid(),
    policy_name text unique not null,
    fight_threshold numeric not null,
    drop_threshold numeric not null,
    min_amount_for_auto_decision numeric not null,
    is_active boolean default true,
    created_at timestamp default now()
);

-- Individual disputes logged by merchants.
create table disputes (
    id uuid primary key default gen_random_uuid(),
    transaction_id text not null,
    network text not null,
    reason_code text not null,
    amount numeric not null,
    currency text default 'INR',
    deadline timestamp not null,
    status text default 'open',
    user_id uuid,
    created_at timestamp default now()
);

-- Evidence items attached to a dispute.
create table evidence_records (
    id uuid primary key default gen_random_uuid(),
    dispute_id uuid references disputes(id) on delete cascade,
    evidence_type text not null,
    is_available boolean default false,
    file_reference text,
    created_at timestamp default now()
);

-- Full audit trail: every decision step, logged and retrievable per dispute.
create table audit_log (
    id uuid primary key default gen_random_uuid(),
    dispute_id uuid references disputes(id) on delete cascade,
    step text not null,
    detail jsonb not null,
    created_at timestamp default now()
);