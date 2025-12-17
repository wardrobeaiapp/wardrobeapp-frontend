DROP TRIGGER IF EXISTS trg_update_ai_analysis_mocks_updated_at ON public.ai_analysis_mocks;
DROP FUNCTION IF EXISTS public.update_ai_analysis_mocks_updated_at();

DROP TRIGGER IF EXISTS trg_update_ai_analysis_mocks_set_updated_at_before ON public.ai_analysis_mocks;

CREATE OR REPLACE FUNCTION public.update_ai_analysis_mocks_set_updated_at_before()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_at IS NULL THEN
      NEW.created_at := now();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_update_ai_analysis_mocks_set_updated_at_before
BEFORE INSERT OR UPDATE ON public.ai_analysis_mocks
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_analysis_mocks_set_updated_at_before();
