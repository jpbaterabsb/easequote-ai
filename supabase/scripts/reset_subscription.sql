-- ==============================================
-- SCRIPT: Reset Subscription Status for Testing
-- ==============================================
-- Este script reseta o status de subscription de um usuário
-- para que você possa testar o fluxo de pagamento novamente.
--
-- COMO USAR:
-- 1. Substitua 'EMAIL_DO_USUARIO' pelo email do usuário
-- 2. Execute no SQL Editor do Supabase Dashboard
-- ==============================================

-- Opção 1: Reset por EMAIL
UPDATE public.profiles
SET 
    subscription_status = 'inactive',
    subscription_id = NULL,
    subscription_plan = NULL,
    stripe_price_id = NULL,
    subscription_end_date = NULL
    -- Não limpa stripe_customer_id para não precisar criar novo customer no Stripe
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'EMAIL_DO_USUARIO'
);

-- ==============================================
-- OU use uma das opções abaixo:
-- ==============================================

-- Opção 2: Reset por USER ID (UUID)
-- UPDATE public.profiles
-- SET 
--     subscription_status = 'inactive',
--     subscription_id = NULL,
--     subscription_plan = NULL,
--     stripe_price_id = NULL,
--     subscription_end_date = NULL
-- WHERE id = 'SEU_USER_ID_AQUI';

-- Opção 3: Reset TODOS os usuários (CUIDADO!)
-- UPDATE public.profiles
-- SET 
--     subscription_status = 'inactive',
--     subscription_id = NULL,
--     subscription_plan = NULL,
--     stripe_price_id = NULL,
--     subscription_end_date = NULL;

-- ==============================================
-- VERIFICAR O RESULTADO
-- ==============================================
-- SELECT 
--     p.id,
--     u.email,
--     p.subscription_status,
--     p.subscription_id,
--     p.subscription_plan,
--     p.stripe_price_id,
--     p.stripe_customer_id,
--     p.subscription_end_date
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE u.email = 'EMAIL_DO_USUARIO';

