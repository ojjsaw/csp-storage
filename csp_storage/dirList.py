import os

def scanDirectory(baseDir,cpath,ignoreList):
    for entry in os.scandir(baseDir):       
        if(entry.path not in ignoreList):            
                #print("inside if")
                if entry.is_dir(follow_symlinks=False): 
                    ignoreCondition = True  
                    #print("entry.path in if",entry.path)                                                        
                    yield from scanDirectory(entry.path,cpath,ignoreList)
                else: 
                    yield entry                                               
                       