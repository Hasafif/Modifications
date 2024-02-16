from .literature_review_class import *
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from .detection_utils import plagiarism_detection
from tenacity import retry, stop_after_attempt, wait_exponential
#backoff & retry implementation
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def Literature_with_retry(self,request):
     data = JSONParser().parse(request)
     print(data)
     style = data.get('style', None)
     researches = data.get('Researches', [])
     subject = data.get('subject', None)
     print(researches)
     res = []
     for i in researches:
          r = Research(i['title'],i['authors'],i['pdf_url'],i['abstract'],i['published'])
          #r = Research(i['title'],i['author'],i['pdfLink'],i['publish_year'])
          res.append(r)
     print(res)
     lr = Literature_Review(res,subject)
     lr.add_citations(style)
     lr.add_references(style)
     return lr.full_literature_review

class LiteratureView(APIView):
     ''' req: (researches:list[dict],style:,subject:str)
      list[i]:{'title':,'authors':,'pdf_url':,'published':},
      style: apa,ieee,mla,ama,asa,aaa,apsa,mhra,oscola
       note: style can not be small 
       subject:the main title of the literature
      (res,201): literature_review: str '''
     @csrf_exempt
     def post(self, request):
        try:
            lr = Literature_with_retry(self,request)
          
            return Response(lr, status=201)
        except Exception as ve:
            return JsonResponse({'detail': str(ve)}, status=500)
#backoff & retry implementation
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def document_with_retry(self, request, *args, **kwargs):
     data = JSONParser().parse(request)
     style = data.get('style', None)
     researches = data.get('Researches', [])
     res = []
     for i in researches:
           r = Research(i['title'],i['authors'],i['pdf_url'],'',i['published'])
           res.append(r)
     ref = documentation(res,style)
     return ref
class Documentation(APIView):
    ''' req: (researches:list[dict],style:str)
      list[i]:{'title':,'authors':,'pdf_url':,'published':},
      style: apa,ieee,mla,ama,asa,aaa,apsa,mhra,oscola
       note: style can not be small letters
      (res,201): literature_review: str '''
    @csrf_exempt
    def post(self, request, *args, **kwargs):
              try:
                  ref = document_with_retry(self,request, *args, **kwargs)
                  return Response(ref['bibstr'], status=201)
                      
              except Exception as ex:
                      return JsonResponse({'detail': str(ex)}, status=500)
#backoff & retry implementation  
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def check_with_retry(self, request, *args, **kwargs):
    data = JSONParser().parse(request)
    text = data.get('text', None)
    status  = plagiarism_detection(text)
    return status
class Plagiarism_detector(APIView):
    ''' req: (text:str)
      (res,201): status:str,check_result:json via webhook '''
    @csrf_exempt
    def post(self, request):
        try:
           status = check_with_retry(self,request)
           return Response(status, status=201)
        except Exception as ex:
            return JsonResponse({'detail': str(ex)}, status=500)